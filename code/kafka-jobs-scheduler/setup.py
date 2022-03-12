from setuptools import setup,find_packages

setup(
    name='kafka-job-scheduler',
    version='0.1.1',    
    description='A job queue based on Apache Kafka',
    url='https://github.com/LostPetInitiative/Kashtanka/tree/main/code/kafka-job-queue',
    author='Dmitry Grechka',
    author_email='dmitry@kashtanka.pet',
    license='MIT',
    packages=find_packages(),
    install_requires=[ 'scikit-image==0.17.2',
                      'Pillow==9.0.1',
                      'kafka-python==2.0.2',
                      'numpy==1.*',
                      ],

    classifiers=[
        'License :: OSI Approved :: MIT License',  
        'Operating System :: POSIX :: Linux',        
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
    ],
)
