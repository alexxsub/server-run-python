import sys, argparse,time,locale
version = "1.0.0"

parser = argparse.ArgumentParser(
    prog = 'calc',
    description = '''Это простая программа, которая выводит сумму a и b, a+b=''',
    epilog = '''© aLexx Sub ☭ , 2021. Автор программы, как всегда,
не несет никакой ответственности ни за что.''',
    add_help = False
)

base_group = parser.add_argument_group (title='Обязательные параметры')
base_group.add_argument("-a", type=int, help="первое слагаемое a")
base_group.add_argument("-b", type=int, help="второе слагаемое b")
optional_group = parser.add_argument_group (title='Дополнительные параметры')
optional_group.add_argument ('--help', '-h', action='help', help='Показывает эту помощь')
optional_group.add_argument ('--version','-v',
            action='version',
            help = 'Вывод текущей версии',
            version='Текущая версия %(prog)s  {}'.format (version))

args = parser.parse_args()
locale.setlocale(locale.LC_TIME, "ru_ru")
print("Старт : %s" % time.strftime("%a, %d %b %Y %H:%M:%S"))
time.sleep( 1 )
print("Аргумент a = %s" % args.a)
time.sleep( 1 )
print("Аргумент b = %s" % args.b)
time.sleep( 1 )
print("a+b = %s" % str(args.a+args.b))
print("Конец : %s" % time.strftime("%a, %d %b %Y %H:%M:%S"),flush = True)

